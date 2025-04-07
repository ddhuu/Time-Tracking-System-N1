"use client";

import { getAllTeams } from "@/api/team.api";
import { getAllUsers } from "@/api/user.api";
import { CreateTeamModal } from "@/app/(pages)/team/create-team-modal";
import { MemberHoverCard } from "@/app/(pages)/team/member-hover-card";
import TeamUpdateDialog from "@/app/(pages)/team/team-update-dialog";
import TeamViewDialog from "@/app/(pages)/team/team-view-dialog";
import { AuthenticatedRoute } from "@/components/shared/authenticated-route";
import DefaultAvatar from "@/components/shared/default-avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/lib/redux-toolkit/hooks";
import { updateUserList } from "@/lib/redux-toolkit/slices/list-user-slice";
import { Pagination } from "@/type_schema/common";
import { Role } from "@/type_schema/role";
import { TeamType } from "@/type_schema/team";
import { UserType } from "@/type_schema/user.schema";
import { format, formatDate } from "date-fns";
import { Eye, FileDown, Filter, MoreHorizontal, Plus, Search, SquarePen, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function Team() {
  const queryParams = useSearchParams();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { replace } = useRouter();
  const users: UserType[] = useAppSelector((state) => state.userListState.users);
  const page = queryParams.get("page") ? Number(queryParams.get("page")) : 1;
  const limit = queryParams.get("limit") ? Number(queryParams.get("limit")) : 10;
  const [keyword, setKeyword] = useState<string>(queryParams.get("keyword") || "");
  const [sortBy, setSortBy] = useState<string>(queryParams.get("sortBy") || "");
  const [sortOrder, setSortOrder] = useState<string>(queryParams.get("sortOrder") || "asc");
  const [teamList, setTeamList] = useState<Pagination<TeamType>>({
    metadata: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    data: []
  });

  const updateQueryParams = (param: string, value: string) => {
    const params = new URLSearchParams(queryParams);
    params.set(param, value);
    const newUrl = `${pathname}?${params.toString()}`;
    replace(newUrl);
  };

  const handleFetchTeams = async (page: number, limit: number, keyword: string, sortBy: string, sortOrder: string) => {
    try {
      let userList = users;
      if (users.length == 0) {
        const fetchedUsers = await getAllUsers();
        userList = fetchedUsers.users;
        dispatch(updateUserList(fetchedUsers.users));
      }
      const result = await getAllTeams(page, limit, keyword, sortBy, sortOrder);
      const { data, metadata } = result;
      const currentTeamList: TeamType[] = data.map((teamItem) => {
        const { users: userIds, lead: leadId, ...rest } = teamItem;
        return {
          ...rest,
          lead: userList.find((user) => user.user_id === leadId)!,
          users: userIds.map((userId) => userList.find((user) => user.user_id === userId)!)
        };
      });
      setTeamList({
        metadata: metadata,
        data: currentTeamList
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  // Fetch teams on component mount
  useEffect(() => {
    handleFetchTeams(page, limit, keyword, sortBy, sortOrder);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setKeyword(keyword);
    setSortBy(sortBy);
    setSortOrder("");
    updateQueryParams("keyword", keyword);
  };

  const goToPage = (page: number) => {
    handleFetchTeams(page, limit, keyword, sortBy, sortOrder);
    updateQueryParams("page", page.toString());
  };

  const handleReloadProjects = () => {
    handleFetchTeams(1, limit, keyword, sortBy, sortOrder);
    updateQueryParams("page", "1");
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
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
          <Button
            variant="outline"
            size="icon"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <CreateTeamModal refetchTeams={handleReloadProjects}>
            <Button className="flex items-center justify-center gap-2 text-white bg-lime-500 rounded-md hover:bg-lime-600 transition cursor-pointer">
              Create <Plus />
            </Button>
          </CreateTeamModal>
          <Button
            variant="outline"
            size="icon"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table className="bg-white dark:bg-slate-700 border border-gray-200 rounded-md select-none">
        <TableCaption>
          <PaginationWithLinks
            page={teamList.metadata.page}
            pageSize={teamList.metadata.limit}
            totalCount={teamList.metadata.total}
            callback={goToPage}
          />
        </TableCaption>
        <TableHeader className="bg-gray-100 dark:bg-slate-800 border border-gray-200">
          <TableRow className="rounded-lg">
            <TableHead className="w-[100px]">No.</TableHead>
            <TableHead className="w-[25%]">Name</TableHead>
            <TableHead className="w-[10%]">Leader</TableHead>
            <TableHead className="w-[40%]">Member</TableHead>
            <TableHead className="w-[15%]">Created At</TableHead>
            <TableHead className="w-[4rem]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamList.data.map((team, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: team.color || "#FF5733" }}
                  ></div>
                  <span className="font-medium">{team.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <MemberHoverCard
                  member={team.lead}
                  lead={team.lead}
                >
                  <div className="relative h-10 w-10 cursor-pointer group">
                    <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 group-hover:shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-shadow duration-300">
                      <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                        {team.lead?.picture ? (
                          <Image
                            src={team.lead.picture}
                            alt={team.lead.name}
                            width={36}
                            height={36}
                            className="rounded-full"
                            priority
                          />
                        ) : (
                          <DefaultAvatar
                            name={team.lead?.name || ""}
                            size={35}
                            className="rounded-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </MemberHoverCard>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2 mr-4">
                    {team.users.map((member, idx) => (
                      <MemberHoverCard
                        member={member}
                        lead={team.lead}
                        key={idx}
                      >
                        <div
                          className={`flex items-center justify-center h-9 w-9 cursor-pointer hover:ring-indigo-600 hover:ring-2 rounded-full`}
                        >
                          {member.picture ? (
                            <Image
                              src={member.picture}
                              alt={member?.name || "Member"}
                              width={36}
                              height={36}
                              className="rounded-full"
                              priority
                            />
                          ) : (
                            <DefaultAvatar
                              name={member?.name}
                              size={35}
                              className="border-gray-200"
                              index={idx}
                            />
                          )}
                        </div>
                      </MemberHoverCard>
                    ))}
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatDate(team.created_at, "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell className="cursor-pointer">
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
                    <TeamViewDialog team={team}>
                      <div className="flex gap-2 items-center cursor-pointer py-1 pl-2 pr-4 hover:bg-gray-100 dark:hover:bg-slate-700 text-md">
                        <Eye size={14} /> Show
                      </div>
                    </TeamViewDialog>
                    <TeamUpdateDialog
                      targetTeam={team}
                      refetchTeams={() => handleFetchTeams(1, limit, keyword, sortBy, sortOrder)}
                    >
                      <div className="flex gap-2 items-center cursor-pointer py-1 pl-2 pr-4 hover:bg-gray-100 dark:hover:bg-slate-700 text-md">
                        <SquarePen size={14} /> Edit
                      </div>
                    </TeamUpdateDialog>
                    <div className="text-red-500 flex gap-2 items-center cursor-pointer py-1 pl-2 pr-4 hover:bg-gray-100 dark:hover:bg-slate-700 text-md">
                      <Trash2
                        size={14}
                        stroke="red"
                      />{" "}
                      Delete
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default AuthenticatedRoute(Team, [Role.SUPER_ADMIN, Role.ADMIN]);
