"use client";

import type React from "react";

import { getAllProjects } from "@/api/project.api";
import { getAllTeams } from "@/api/team.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { activityFilters } from "@/type_schema/activity";
import { ProjectType } from "@/type_schema/project";
import { TeamSimpleType } from "@/type_schema/team";
import { Filter, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function FilterActivityModal({
  children,
  keyword,
  sortBy,
  sortOrder,
  projectId,
  teamId,
  budgetFrom,
  budgetTo,
  handleFilterChangeAction
}: {
  children: React.ReactNode;
  keyword: string;
  sortBy: string;
  sortOrder: string;
  projectId: string;
  teamId: string;
  budgetFrom: string;
  budgetTo: string;
  handleFilterChangeAction: (props: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    keyword: keyword,
    sortBy: sortBy,
    sortOrder: sortOrder,
    projectId: projectId,
    teamId: teamId,
    budgetFrom: budgetFrom,
    budgetTo: budgetTo
  });
  const [projectList, setProjectList] = useState<ProjectType[] | null>(null);
  const [teamList, setTeamList] = useState<TeamSimpleType[] | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [projects, teams] = await Promise.all([getAllProjects(), getAllTeams()]);
        setProjectList(projects.data);
        setTeamList(teams.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    handleFilterChangeAction({
      _keyword: filters.keyword,
      _sortBy: filters.sortBy,
      _sortOrder: filters.sortOrder,
      _projectId: filters.projectId,
      _teamId: filters.teamId,
      _budgetFrom: filters.budgetFrom,
      _budgetTo: filters.budgetTo
    });
    setOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      sortBy: "",
      sortOrder: "desc",
      projectId: "",
      teamId: "",
      budgetFrom: "",
      budgetTo: ""
    });
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 border border-gray-200 !p-0"
        align="end"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 pl-2">
            <Filter className="h-4 w-4" />
            <h4 className="font-medium">Filter Activities</h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="!m-0" />

        <div className="grid gap-4 p-2">
          <div className="grid gap-2 md:hidden">
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              placeholder="Search..."
              className="border border-gray-200"
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger
                  id="sortBy"
                  className="border border-gray-200 !w-full"
                >
                  <SelectValue
                    placeholder="Sort By"
                    defaultValue={filters.sortBy}
                  />
                </SelectTrigger>
                <SelectContent>
                  {activityFilters.map((filter, index) => (
                    <SelectItem
                      key={index}
                      value={filter.name}
                    >
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Order</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => handleFilterChange("sortOrder", value)}
              >
                <SelectTrigger
                  id="sortOrder"
                  className="border border-gray-200 !w-full"
                >
                  <SelectValue
                    placeholder="Order"
                    defaultValue={filters.sortOrder}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {projectList && (
            <div className="grid gap-2">
              <Label htmlFor="projectId">Project</Label>
              <Select
                onValueChange={(value) => handleFilterChange("projectId", value)}
                value={filters.projectId}
              >
                <SelectTrigger className="w-full !mt-0 border-gray-200">
                  <SelectValue
                    placeholder="Select project"
                    defaultValue={filters.projectId}
                  />
                </SelectTrigger>
                <SelectContent>
                  {projectList.map((project, index) => (
                    <SelectItem
                      key={index}
                      value={project.id.toString()}
                      className="flex items-center gap-1"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color || "#FF5733" }}
                      ></div>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {teamList && (
            <div className="grid gap-2">
              <Label htmlFor="teamId">Team</Label>
              <Select
                onValueChange={(value) => handleFilterChange("teamId", value)}
                value={filters.teamId}
              >
                <SelectTrigger className="w-full !mt-0 border-gray-200">
                  <SelectValue
                    placeholder="Select project"
                    defaultValue={filters.projectId}
                  />
                </SelectTrigger>
                <SelectContent>
                  {teamList.map((team, index) => (
                    <SelectItem
                      key={index}
                      value={team.id.toString()}
                      className="flex items-center gap-1"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: team.color || "#FF5733" }}
                      ></div>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="budgetFrom">Budget From</Label>
              <Input
                id="budgetFrom"
                placeholder="From"
                type="number"
                className="border border-gray-200"
                value={filters.budgetFrom}
                onChange={(e) => handleFilterChange("budgetFrom", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budgetTo">Budget To</Label>
              <Input
                id="budgetTo"
                placeholder="To"
                className="border border-gray-200"
                value={filters.budgetTo}
                onChange={(e) => handleFilterChange("budgetTo", e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator className="mt-1" />

        <div className="flex justify-end p-2 items-stretch gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer border border-gray-200"
            onClick={handleResetFilters}
          >
            Reset
          </Button>
          <Button
            size="sm"
            className="cursor-pointer bg-main text-white"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
