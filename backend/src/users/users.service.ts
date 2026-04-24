import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username: username.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password');
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async updateById(id: string, update: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, update, { new: true }).select('-password');
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  async usernameExists(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username: username.toLowerCase() });
    return !!user;
  }
}
