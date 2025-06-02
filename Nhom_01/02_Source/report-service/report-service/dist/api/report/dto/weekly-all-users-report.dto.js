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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklyAllUsersReportDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class WeeklyAllUsersReportDto {
}
exports.WeeklyAllUsersReportDto = WeeklyAllUsersReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date for the report period (ISO format)',
        example: '2025-01-01',
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'fromDate is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'fromDate must be a valid date string' }),
    __metadata("design:type", String)
], WeeklyAllUsersReportDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date for the report period (ISO format)',
        example: '2025-01-07',
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'toDate is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'toDate must be a valid date string' }),
    __metadata("design:type", String)
], WeeklyAllUsersReportDto.prototype, "toDate", void 0);
//# sourceMappingURL=weekly-all-users-report.dto.js.map