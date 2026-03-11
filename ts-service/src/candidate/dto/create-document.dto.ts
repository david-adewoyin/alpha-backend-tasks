import { IsEnum, IsNotEmpty, IsString, } from "class-validator";

export enum DocumentType {
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
}

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsEnum(DocumentType, {
    message: 'documentType must be exactly "resume" or "cover_letter"',
  })
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  rawText!: string;
}