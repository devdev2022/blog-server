import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { SubCategory } from "./SubCategory";
import { User } from "./User";

@Entity("main_categories")
export class MainCategory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @ManyToOne(() => User, (user) => user.mainCategories)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => SubCategory, (sub) => sub.mainCategory)
  subCategories!: SubCategory[];
}
