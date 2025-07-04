"use client";

import { getAllActivities } from "@/api/activity.api";
import { getAllProjects } from "@/api/project.api";
import { getAllTasks } from "@/api/task.api";
import { endTimesheetRecord, getAllMyTimesheets } from "@/api/timesheet.api";
import FilterTimesheetModal from "@/app/(pages)/timesheet/filter-modal";
import { ManualTimesheetCreateDialog } from "@/app/(pages)/timesheet/manual-timesheet-create-dialog";
import { TimesheetCreateDialog } from "@/app/(pages)/timesheet/timesheet-create-dialog";
import TimesheetViewDialog from "@/app/(pages)/timesheet/timesheet-view-dialog";
import Loading from "@/app/loading";
import { AuthenticatedRoute } from "@/components/shared/authenticated-route";
import { TableSkeleton } from "@/components/skeleton/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { useAppSelector } from "@/lib/redux-toolkit/hooks";
import { secondsToTime } from "@/lib/utils";
import { Pagination } from "@/type_schema/common";
import { ApprovalStatus } from "@/type_schema/request";
import { TimesheetStatus, TimesheetType } from "@/type_schema/timesheet";
import { UserType } from "@/type_schema/user.schema";
import { useUser } from "@auth0/nextjs-auth0/client";
import { format } from "date-fns";
import debounce from "debounce";
import { Eye, Filter, MoreHorizontal, Play, Plus, Search, Square, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function Timesheet() {
  const queryParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { user: currentUser } = useUser();
  const page = queryParams.get("page") ? Number(queryParams.get("page")) : 1;
  const limit = queryParams.get("limit") ? Number(queryParams.get("limit")) : 10;
  const searchKeyword = queryParams.get("keyword") || "";
  const [keyword, setKeyword] = useState<string>(searchKeyword);
  const sortBy = queryParams.get("sortBy") || "";
  const sortOrder = queryParams.get("sortOrder") || "";
  const projectId = queryParams.get("projectId") || "";
  const activityId = queryParams.get("activityId") || "";
  const taskId = queryParams.get("taskId") || "";
  const userId = queryParams.get("userId") || "";
  const status = queryParams.get("status") || "";
  const fromDate = queryParams.get("fromDate") || "";
  const toDate = queryParams.get("toDate") || "";
  const userList = useAppSelector((state) => state.userListState.users) as UserType[];
  const [loadingPage, setLoadingPage] = useState(false);
  const [trackingTime, setTrackingTime] = useState<TimesheetType | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shouldShowActionButtons, setShouldShowActionButtons] = useState(false);
  const [timesheetList, setTimesheetList] = useState<Pagination<TimesheetType> | null>(null);

  const updateQueryParams = (param: string, value: string) => {
    const params = new URLSearchParams(queryParams);
    params.set(param, value);
    const newUrl = `${pathname}?${params.toString()}`;
    replace(newUrl);
  };

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

  const handleFetchTimesheets = async (
    page?: number,
    limit?: number,
    keyword?: string,
    sortBy?: string,
    sortOrder?: string
  ) => {
    // Start all fetch requests concurrently
    const [projects, activities, tasks] = await Promise.all([
      getAllProjects(1, 250),
      getAllActivities(1, 150),
      getAllTasks(1, 250)
    ]);
    const result = await getAllMyTimesheets(
      page,
      limit,
      keyword,
      sortBy,
      sortOrder,
      fromDate,
      toDate,
      userId,
      projectId,
      activityId,
      taskId,
      status
    );
    const { data, metadata } = result;
    console.log(data);
    const timesheets: TimesheetType[] = data
      .map((timesheet) => {
        const { user_id, project_id, activity_id, task_id, ...rest } = timesheet;
        return {
          ...rest,
          status: timesheet.status,
          user: userList.find((user) => user.user_id === user_id)!,
          project: projects.data.find((project) => project.id === project_id)!,
          activity: activities.data.find((activity) => activity.id === activity_id)!,
          task: tasks.data.find((task) => task.id === task_id)!
        };
      })
      .filter((timesheet) => timesheet.user.user_id === currentUser?.sub);
    setTimesheetList({
      data: timesheets,
      metadata
    });

    const runningRecord = timesheets.find(
      (timesheet) => timesheet.status === TimesheetStatus.TRACKING && timesheet.user.user_id === currentUser!.sub
    );
    if (runningRecord) {
      setTrackingTime(runningRecord);
      const timeStr = Math.floor(Date.now() - new Date(runningRecord.start_time).getTime()) / 1000;
      setElapsedTime(timeStr);
    }
    setShouldShowActionButtons(true);
  };

  const goToPage = (page: number) => {
    handleFetchTimesheets(page, limit, keyword, sortBy, sortOrder);
    updateQueryParams("page", page.toString());
  };

  // Handle ending a running timesheet
  const handleEndTimesheet = async () => {
    setTrackingTime(null);
    setElapsedTime(0);
    const result = await endTimesheetRecord();
    if (result == 201 || result == 200) {
      toast("End tracking", {
        duration: 2000,
        className: "!bg-lime-500 !text-white",
        description: "Timesheet ended successfully"
      });
      await handleFetchTimesheets(1, limit);
    } else {
      toast("Error", {
        duration: 2000,
        className: "!bg-red-500 !text-white",
        description: "Error ending timesheet"
      });
    }
  };

  async function handleStartingTracking(): Promise<void> {
    handleFetchTimesheets(1);
  }

  useEffect(() => {
    handleFetchTimesheets(page, limit, searchKeyword, sortBy, sortOrder);
  }, [page, limit, searchKeyword, sortBy, sortOrder]);

  useEffect(() => {
    if (!trackingTime) return;
    const intervalId = setInterval(() => {
      const timeStr = Math.floor(Date.now() - new Date(trackingTime.start_time).getTime()) / 1000;
      setElapsedTime(timeStr);
    }, 1000);
    setLoadingPage(false);
    return () => {
      clearInterval(intervalId);
    };
  }, [trackingTime]);

  const updateUrl = (params: URLSearchParams) => {
    const newUrl = `${pathname}?${params.toString()}`;
    replace(newUrl);
  };

  const handleFilterChange = (props: any) => {
    const params = new URLSearchParams();
    const { _sortBy, _sortOrder, _projectId, _activityId, _taskId, _userId, _status, _fromDate, _toDate } = props;
    params.set("page", "1"); // Reset to first page when applying filters
    if (_sortBy) params.set("sortBy", _sortBy);
    if (_sortOrder) params.set("sortOrder", _sortOrder);
    if (_projectId) params.set("projectId", _projectId);
    if (_activityId) params.set("activityId", _activityId);
    if (_taskId) params.set("taskId", _taskId);
    if (_userId) params.set("userId", _userId);
    if (_status) params.set("status", _status);
    if (_fromDate) params.set("fromDate", _fromDate);
    if (_toDate) params.set("toDate", _toDate);
    updateUrl(params);
  };

  const getTimesheetTrackingStatusBadge = (status: string) => {
    switch (status) {
      case TimesheetStatus.TRACKING:
        return (
          <Badge
            variant="outline"
            className="bg-main text-white"
          >
            Tracking
          </Badge>
        );
      case TimesheetStatus.TRACKED:
        return (
          <Badge
            variant="outline"
            className="bg-lime-500 text-white"
          >
            Tracked
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-500 text-gray-50"
          >
            N/A
          </Badge>
        );
    }
  };

  const getTimesheetApprovalStatusBadge = (status?: string) => {
    if (!status || status === "") {
      return (
        <Badge
          variant="outline"
          className="bg-gray-500 text-white"
        >
          N/A
        </Badge>
      );
    }
    switch (status) {
      case ApprovalStatus.APPROVED:
        return (
          <Badge
            variant="outline"
            className="bg-green-500 text-green-50"
          >
            Confirmed
          </Badge>
        );
      case ApprovalStatus.PROCESSING:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500 text-white"
          >
            Processing
          </Badge>
        );
      case ApprovalStatus.REJECTED:
        return (
          <Badge
            variant="outline"
            className="bg-rose-500 text-yellow-50"
          >
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-500 text-gray-50"
          >
            N/A
          </Badge>
        );
    }
  };

  if (loadingPage) return <Loading />;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Timesheets</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[200px] border border-gray-200 bg-white dark:bg-slate-700"
              value={keyword}
              onChange={handleSearchChange}
            />
          </div>
          <FilterTimesheetModal
            handleFilterChangeAction={handleFilterChange}
            keyword={keyword}
            sortBy={sortBy}
            sortOrder={sortOrder}
            projectId={projectId}
            activityId={activityId}
            taskId={taskId}
            userId={userId}
            status={status}
            fromDate={fromDate}
            toDate={toDate}
          >
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center cursor-pointer border border-gray-200"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </FilterTimesheetModal>
          {shouldShowActionButtons && (
            <>
              {elapsedTime ? (
                <Button
                  onClick={handleEndTimesheet}
                  className="flex items-center bg-red-500 hover:bg-red-600 cursor-pointer text-white"
                >
                  <Square className="h-4 w-4" /> {secondsToTime(elapsedTime)}
                </Button>
              ) : (
                <TimesheetCreateDialog fetchTimesheets={handleStartingTracking}>
                  <Button className="flex items-center bg-main cursor-pointer text-white">
                    <Play className="h-4 w-4" /> Start
                  </Button>
                </TimesheetCreateDialog>
              )}
              <ManualTimesheetCreateDialog fetchTimesheets={() => handleFetchTimesheets(1)}>
                <Button className="flex items-center bg-main gap-2 cursor-pointer text-white">
                  Create <Plus />
                </Button>
              </ManualTimesheetCreateDialog>
            </>
          )}
          {/* <Button
            variant="outline"
            size="icon"
            className="border border-gray-200 cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border border-gray-200 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border border-gray-200 bg-white dark:bg-slate-700">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Task</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Start</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">End</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Duration</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tracking state
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  Approval status
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            {!timesheetList && <TableSkeleton columns={7} />}
            <tbody>
              {timesheetList && timesheetList.data.length === 0 && (
                <tr className="h-48 text-center">
                  <td
                    colSpan={7}
                    className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400"
                  >
                    No timesheet records found.
                  </td>
                </tr>
              )}
              {timesheetList &&
                timesheetList.data.map((timesheet, index) => (
                  <tr
                    key={index}
                    className={`border-t dark:border-slate-700 `}
                  >
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{timesheet.task?.title} </td>

                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {format(timesheet.start_time, "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {timesheet.end_time ? format(timesheet.end_time, "dd/MM/yyyy HH:mm") : "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {secondsToTime(timesheet.duration)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">
                      {getTimesheetTrackingStatusBadge(timesheet.status)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">
                      <Link href={`/request`}>{getTimesheetApprovalStatusBadge(timesheet.request_status)}</Link>
                    </td>

                    <td className="px-4 py-2 text-center">
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
                          <TimesheetViewDialog timesheet={timesheet}>
                            <div className="flex gap-2 items-center cursor-pointer py-1 pl-2 pr-4 hover:bg-gray-100 dark:hover:bg-slate-700 text-md">
                              <Eye size={14} /> Show
                            </div>
                          </TimesheetViewDialog>
                          {/* <div className="text-red-500 flex gap-2 items-center cursor-pointer py-1 pl-2 pr-4 hover:bg-gray-100 dark:hover:bg-slate-700 text-md">
                            <Trash2
                              size={14}
                              stroke="red"
                            />{" "}
                            Delete
                          </div> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {timesheetList && (
          <PaginationWithLinks
            page={timesheetList.metadata.page}
            pageSize={timesheetList.metadata.limit}
            totalCount={timesheetList.metadata.total}
            callback={goToPage}
          />
        )}
      </div>
    </>
  );
}

export default AuthenticatedRoute(Timesheet, []);
