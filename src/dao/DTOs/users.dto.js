export default class UsersDto {
  constructor(user) {
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.phone_number = user.phone_number;
    this.home_address = user.home_address;
    this.zip_code = user.zip_code;
    this.state = user.state;
    this.city = user.city;
    this.role = user.role;
  }
}
