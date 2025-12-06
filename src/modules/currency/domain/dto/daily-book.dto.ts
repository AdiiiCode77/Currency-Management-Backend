import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class DailyBookDto {
  @ApiProperty({})
  @IsDateString({}, { message: "date must be a valid ISO date string (YYYY-MM-DD)" })
  date: string;
}
