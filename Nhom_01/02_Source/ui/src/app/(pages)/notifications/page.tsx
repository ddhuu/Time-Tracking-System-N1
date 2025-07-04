"use client";

import { callMarkAsReadNotificationRequest, getAllNotifications } from "@/api/notification.api";
import FilterNotificationModal from "@/app/(pages)/notifications/filter-modal";
import { RequestPageType } from "@/app/(pages)/request/request-items";
import { AuthenticatedRoute } from "@/components/shared/authenticated-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/type_schema/common";
import { NotificationType, NotificationTypeType } from "@/type_schema/notification";
import { useUser } from "@auth0/nextjs-auth0/client";
import { formatDistanceToNow } from "date-fns";
import debounce from "debounce";
import { Bell, Calendar, Clock, CreditCard, ExternalLink, FileText, Filter, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function NotificationPage() {
  const queryParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const page = queryParams.get("page") ? Number(queryParams.get("page")) : 1;
  const limit = queryParams.get("limit") ? Number(queryParams.get("limit")) : 10;
  const searchKeyword = queryParams.get("keyword") || "";
  const { user: currentUser } = useUser();
  const [keyword, setKeyword] = useState<string>(searchKeyword);
  const [sortBy, setSortBy] = useState<string>(queryParams.get("sortBy") || "");
  const [sortOrder, setSortOrder] = useState<string>(queryParams.get("sortOrder") || "asc");
  const [startDate, setStartDate] = useState<string>(queryParams.get("start_date") || "");
  const [endDate, setEndDate] = useState<string>(queryParams.get("end_date") || "");
  const [type, setType] = useState<string>(queryParams.get("type") || "");
  const [hasRead, setHasRead] = useState<string>(queryParams.get("has_read") || "false");
  const [notificationList, setNotificationList] = useState<Pagination<NotificationType> | null>(null);

  const updateQueryParams = (param: string, value: string) => {
    const params = new URLSearchParams(queryParams);
    params.set(param, value);
    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl);
  };

  const handleUpdateKeyword = (keyword: string) => {
    updateQueryParams("keyword", keyword);
  };
  const debounceSearchKeyword = useCallback(debounce(handleUpdateKeyword, 1000), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setKeyword(keyword);
    debounceSearchKeyword(keyword);
  };

  const updateUrl = (params: URLSearchParams) => {
    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl);
  };

  const handleFilterChange = (props: any) => {
    const params = new URLSearchParams();
    const { _sortBy, _sortOrder, _startDate, _endDate, _type, _hasRead } = props;
    params.set("page", "1"); // Reset to first page when applying filters
    if (_sortBy) params.set("sortBy", _sortBy);
    if (_sortOrder) params.set("sortOrder", _sortOrder);
    if (_startDate) params.set("start_date", _startDate);
    if (_endDate) params.set("end_date", _endDate);
    if (_type) params.set("type", _type);
    if (_hasRead) params.set("has_read", _hasRead);
    updateUrl(params);
  };

  const handleFetchNotifications = async (
    page?: number,
    limit?: number,
    keyword?: string,
    sortBy?: string,
    sortOrder?: string,
    startDate?: string,
    endDate?: string,
    type?: string,
    hasRead?: string
  ) => {
    try {
      const result = await getAllNotifications(
        page,
        limit,
        keyword,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        type,
        hasRead
      );
      result.data = result.data.filter((notification) => notification.user_id === currentUser!.sub);

      setNotificationList(result);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const fetchNecessaryData = async () => {
      await handleFetchNotifications(page, limit, searchKeyword, sortBy, sortOrder, startDate, endDate, type, hasRead);
    };
    fetchNecessaryData();
  }, [page, limit, searchKeyword, sortBy, sortOrder, startDate, endDate, type, hasRead]);

  const goToPage = (page: number) => {
    handleFetchNotifications(page, limit, keyword, sortBy, sortOrder);
    updateQueryParams("page", page.toString());
  };

  const determineUrl = (type: NotificationTypeType, targetId: string) => {
    switch (type) {
      case NotificationTypeType.EXPENSE_REQUEST:
      case NotificationTypeType.EXPENSE_REQUEST_STATUS:
        return `/request?rq=${RequestPageType.TASK}&targetId=${targetId}`;
      case NotificationTypeType.ABSENCE_REQUEST:
      case NotificationTypeType.ABSENCE_REQUEST_STATUS:
        return `/request?rq=${RequestPageType.ABSENCE}&targetId=${targetId}`;
      case NotificationTypeType.TIMESHEET_REQUEST:
      case NotificationTypeType.TIMESHEET_REQUEST_STATUS:
        return `/request?rq=${RequestPageType.TIMESHEET}&targetId=${targetId}`;
      default:
        return `/request`;
    }
  };

  const handleMarkAsReadAndRedirect = async (notification: NotificationType) => {
    if (!notification.has_read) {
      const result = await callMarkAsReadNotificationRequest(notification.id.toString());
      if (result == 200 || result == 201) {
        const { data, metadata } = notificationList!;
        const currentNotifications = [...data];
        const notificationIndex = currentNotifications.findIndex((n) => n.id === notification.id);
        currentNotifications[notificationIndex].has_read = true;
        setNotificationList({
          metadata: metadata,
          data: currentNotifications
        });
      }
    }
    const determinedUrl = determineUrl(notification.type, notification.target_id);
    router.replace(determinedUrl);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
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
          <FilterNotificationModal
            handleFilterChangeAction={handleFilterChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            startDate={startDate}
            endDate={endDate}
            type={type}
            hasRead={hasRead}
          >
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center cursor-pointer border border-gray-200"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </FilterNotificationModal>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-muted-foreground mt-1">Stay updated with your requests and approvals</p>
          </div>
          <div className="flex items-center">
            {notificationList && (
              <Badge
                variant="secondary"
                className="font-medium text-white"
              >
                {notificationList.data.filter((n) => !n.has_read).length} Unread
              </Badge>
            )}
          </div>
        </div>
        {!notificationList ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-4"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notificationList && notificationList.data.length > 0 ? (
          <div className="space-y-1">
            {notificationList.data.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsReadAndRedirect(notification)}
                className={`flex p-4 border border-gray-200 rounded-lg bg-white dark:bg-slate-900 hover:bg-gray-200/50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                  !notification.has_read ? "bg-muted/20" : ""
                }`}
              >
                <div className="mr-4 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${!notification.has_read ? "font-semibold" : ""}`}>
                        {notification.title}
                      </h3>
                      {!notification.has_read && <span className="h-2 w-2 rounded-full bg-rose-500"></span>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.type === NotificationTypeType.TIMESHEET_REQUEST
                      ? "A member has just started a timesheet"
                      : notification.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View details
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg dark:bg-slate-800">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">You don't have any notifications at the moment</p>
          </div>
        )}
      </div>

      {notificationList && (
        <PaginationWithLinks
          page={notificationList.metadata.page}
          pageSize={notificationList.metadata.limit}
          totalCount={notificationList.metadata.total}
          callback={goToPage}
        />
      )}
    </>
  );
}

export default AuthenticatedRoute(NotificationPage, []);

const getNotificationIcon = (type: NotificationTypeType) => {
  switch (type) {
    case NotificationTypeType.EXPENSE_REQUEST_STATUS:
    case NotificationTypeType.EXPENSE_REQUEST:
      return <CreditCard className="h-5 w-5 text-emerald-500" />;
    case NotificationTypeType.ABSENCE_REQUEST_STATUS:
    case NotificationTypeType.ABSENCE_REQUEST:
      return <Calendar className="h-5 w-5 text-violet-500" />;
    case NotificationTypeType.TIMESHEET_REQUEST_STATUS:
    case NotificationTypeType.TIMESHEET_REQUEST:
      return <Clock className="h-5 w-5 text-amber-500" />;
    default:
      return <FileText className="h-5 w-5 text-sky-500" />;
  }
};

const getNotificationTypeLabel = (type: NotificationTypeType) => {
  switch (type) {
    case "expense_request":
      return "Expense Request";
    case "expense_request_status":
      return "Expense Status";
    case "absence_request":
      return "Absence Request";
    case "absence_request_status":
      return "Absence Status";
    case "timesheet_request":
      return "Timesheet";
    case "timesheet_request_status":
      return "Timesheet Status";
    default:
      return "Notification";
  }
};

const getNotificationTypeColor = (type: NotificationTypeType) => {
  if (type.includes("expense")) return "bg-emerald-50 text-emerald-700";
  if (type.includes("absence")) return "bg-violet-50 text-violet-700";
  if (type.includes("timesheet")) return "bg-amber-50 text-amber-700";
  return "bg-sky-50 text-sky-700";
};
