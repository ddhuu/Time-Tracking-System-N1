"use client";

import { getAllProjects } from "@/api/project.api";
import FilterProjectModal from "@/app/(pages)/project/filter-modal";
import { ProjectCreateDialog } from "@/app/(pages)/project/project-create-dialog";
import { ProjectUpdateDialog } from "@/app/(pages)/project/project-update-dialog";
import ProjectViewDialog from "@/app/(pages)/project/project-view-dialog";
import { AuthenticatedRoute } from "@/components/shared/authenticated-route";
import { TableSkeleton } from "@/components/skeleton/table-skeleton";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/type_schema/common";
import { ProjectType } from "@/type_schema/project";
import { Role } from "@/type_schema/role";
import { formatDate } from "date-fns";
import debounce from "debounce";
import { Eye, FileDown, Filter, MoreHorizontal, Plus, Search, SquarePen, Trash2, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function ProjectPage() {
  const queryParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const page = queryParams.get("page") ? Number(queryParams.get("page")) : 1;
  const limit = queryParams.get("limit") ? Number(queryParams.get("limit")) : 10;
  const searchKeyword = queryParams.get("keyword") || "";
  const [keyword, setKeyword] = useState<string>(searchKeyword);
  const [sortBy, setSortBy] = useState<string>(queryParams.get("sortBy") || "");
  const [sortOrder, setSortOrder] = useState<string>(queryParams.get("sortOrder") || "asc");
  const customerId = queryParams.get("customerId") || "";
  const teamId = queryParams.get("teamId") || "";
  const budgetFrom = queryParams.get("budgetFrom") || "";
  const budgetTo = queryParams.get("budgetTo") || "";
  const [projectList, setProjectList] = useState<Pagination<ProjectType> | null>(null);

  const updateQueryParams = (param: string, value: string) => {
    const params = new URLSearchParams(queryParams);
    params.set(param, value);
    const newUrl = `${pathname}?${params.toString()}`;
    replace(newUrl);
  };

  const fetchProjects = async (page: number, limit: number, keyword: string, sortBy: string, sortOrder: string) => {
    const result = await getAllProjects(
      page,
      limit,
      keyword,
      sortBy,
      sortOrder,
      customerId,
      teamId,
      budgetFrom,
      budgetTo
    );
    setProjectList(result);
  };

  useEffect(() => {
    fetchProjects(page, limit, searchKeyword, sortBy, sortOrder);
  }, [page, limit, searchKeyword, sortBy, sortOrder]);

  // Handle search input change
  const handleUpdateKeyword = (keyword: string) => {
    updateQueryParams("keyword", keyword);
  };
  const debounceSearchKeyword = useCallback(debounce(handleUpdateKeyword, 1000), []);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setKeyword(keyword);
    debounceSearchKeyword(keyword);
  };

  const goToPage = (page: number) => {
    fetchProjects(page, limit, keyword, sortBy, sortOrder);
    updateQueryParams("page", page.toString());
  };

  const handleReloadProjects = () => {
    fetchProjects(1, limit, keyword, sortBy, sortOrder);
    const params = new URLSearchParams(queryParams);
    params.set("page", "1");
    const newUrl = `${pathname}?${params.toString()}`;
    replace(newUrl);
  };

  const updateUrl = (params: URLSearchParams) => {
    const newUrl = `${pathname}?${params.toString()}`;
    replace(newUrl);
  };

  const handleFilterChange = (props: any) => {
    const params = new URLSearchParams();
    const { _keyword, _sortBy, _sortOrder, _customerId, _teamId, _budgetFrom, _budgetTo } = props;
    params.set("page", "1"); // Reset to first page when applying filters
    if (_sortBy) params.set("sortBy", _sortBy);
    if (_sortOrder) params.set("sortOrder", _sortOrder);
    if (_customerId) params.set("customerId", _customerId);
    if (_teamId) params.set("teamId", _teamId);
    if (_budgetFrom) params.set("budgetFrom", _budgetFrom);
    if (_budgetTo) params.set("budgetTo", _budgetTo);
    if (_keyword) params.set("keyword", _keyword);
    updateUrl(params);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[200px] bg-white dark:bg-slate-700 border border-gray-200"
              value={keyword}
              onChange={handleSearchChange}
            />
          </div>
          <FilterProjectModal
            handleFilterChangeAction={handleFilterChange}
            keyword={keyword}
            sortBy={sortBy}
            sortOrder={sortOrder}
            customerId={customerId}
            teamId={teamId}
            budgetFrom={budgetFrom}
            budgetTo={budgetTo}
          >
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center cursor-pointer border border-gray-200"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </FilterProjectModal>
          <ProjectCreateDialog refetchProjects={handleReloadProjects}>
            <Button className="flex items-center justify-center gap-2 cursor-pointer bg-main text-white">
              Create <Plus />
            </Button>
          </ProjectCreateDialog>
        </div>
      </div>

      <div className="select-none">
        <Table className="rounded-lg border border-slate-200 bg-white dark:bg-slate-700">
          {projectList && (
            <TableCaption>
              <PaginationWithLinks
                page={projectList.metadata.page}
                pageSize={projectList.metadata.limit}
                totalCount={projectList.metadata.total}
                callback={goToPage}
              />
            </TableCaption>
          )}
          <TableHeader className="rounded-lg border border-slate-200 bg-gray-100 dark:bg-slate-800">
            <TableRow>
              <TableHead className="w-[5%] text-center">No</TableHead>
              <TableHead className="w-[20%]">Name</TableHead>
              <TableHead className="w-[20%]">Customer</TableHead>
              <TableHead className="w-[10%]">Budget</TableHead>
              <TableHead className="w-[30%]">Time</TableHead>
              <TableHead className="w-[5%]">Action</TableHead>
            </TableRow>
          </TableHeader>
          {!projectList && <TableSkeleton />}
          <TableBody>
            {projectList && projectList.data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12"
                >
                  No projects found
                </TableCell>
              </TableRow>
            )}
            {projectList &&
              projectList.data.map((project, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color || "#6C757D" }}
                      ></div>
                      <span className="ml-2 text-muted-foreground">{project.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="">{project.customer?.name}</TableCell>
                  <TableCell className="">{project.budget ? `${project.budget}$` : "-"}</TableCell>
                  <TableCell className="">
                    {formatDate(project.start_date!, "dd/MM/yyyy")}
                    <span> - </span>
                    {project.end_date ? formatDate(project.end_date, "dd/MM/yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border border-gray-200"
                      >
                        <ProjectViewDialog project={project}>
                          <div className="flex gap-2 items-center cursor-pointer py-1 pl-2 pr-4 hover:bg-gray-100 dark:hover:bg-slate-700 text-md">
                            <Eye size={14} /> Show
                          </div>
                        </ProjectViewDialog>
                        <ProjectUpdateDialog
                          targetProject={project}
                          refetchProjects={handleReloadProjects}
                        >
                          <div className="flex gap-2 items-center cursor-pointer py-1 pl-2 pr-4 hover:bg-gray-100 dark:hover:bg-slate-700 text-md">
                            <SquarePen size={14} />
                            Edit
                          </div>
                        </ProjectUpdateDialog>
                        {/* <div className="text-red-500 flex gap-2 items-center cursor-pointer py-1 pl-2 pr-4 hover:bg-gray-100 dark:hover:bg-slate-700 text-md">
                          <Trash2 size={14} />
                          Delete
                        </div> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default AuthenticatedRoute(ProjectPage, [Role.SUPER_ADMIN, Role.ADMIN]);
