import { GetUserDto } from "@common/dto/get-user.dto";
import { User } from "@common/models/user.entity";
import { LocalizedStringID } from "@common/utils/Locale";
import { Injectable } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";

@Injectable()
export class UserAdapter {
  public async transform(user: User, i18n: I18nContext): Promise<GetUserDto> {
    return {
      id: user.id.toString(),
      email: user.email,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      phone: user.phone,
      rating: user.rating,
      verified: user.verified,
      type: user.type,
      type_localized: await i18n.t(
        `global.USER_TYPE_${user.type.toUpperCase()}` as LocalizedStringID
      ),
      created_timestamp: user.created_timestamp.toISOString(),
      avatar: [null, undefined].indexOf(user.avatar) >= 0 ? "https://react.semantic-ui.com/images/avatar/large/matt.jpg" : user.avatar
    };
  }
}