import { Expose } from 'class-transformer';


export class ClientAnnouncementDto {
  @Expose()
  announcement: string;
}
