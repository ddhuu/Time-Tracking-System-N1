"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("../../domain/report/report.service");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
let ReportController = class ReportController {
    constructor(reportService) {
        this.reportService = reportService;
    }
    async getWeeklyOneUserReport(dto, authHeader) {
        return this.reportService.getWeeklyOneUserReport(dto.userId.toString(), dto.fromDate, dto.toDate, authHeader);
    }
    async getWeeklyAllUsersReport(dto, authHeader) {
        return this.reportService.getWeeklyAllUsersReport(dto.fromDate, dto.toDate, authHeader);
    }
    async getProjectOverviewReport(dto, authHeader) {
        return this.reportService.getProjectOverviewReport(dto.customerId, authHeader);
    }
    async getDashboardData(userId, authHeader) {
        return this.reportService.getDashboardData(userId, authHeader);
    }
    async getAllUsersDashboardData(authHeader) {
        return this.reportService.getDashboardData(undefined, authHeader);
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get weekly report for one user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns weekly report data for a specific user',
        type: Object
    }),
    (0, common_1.Get)('one-user'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.WeeklyUserReportDto, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getWeeklyOneUserReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get weekly report for all users' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns weekly report data for all users',
        type: Object
    }),
    (0, common_1.Get)('all-users'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.WeeklyAllUsersReportDto, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getWeeklyAllUsersReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get project overview report' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns overview data for all projects or filtered by customer',
        type: Object
    }),
    (0, common_1.Get)('projects/overview'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ProjectOverviewReportDto, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getProjectOverviewReport", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard data' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns dashboard data including timesheet summary and chart data',
        type: Object
    }),
    (0, common_1.Get)('dashboard/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getDashboardData", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard data for all users' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns dashboard data for all users',
        type: Object
    }),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getAllUsersDashboardData", null);
exports.ReportController = ReportController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportController);
//# sourceMappingURL=report.controller.js.map