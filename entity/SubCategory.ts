import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { MainCategory } from "./MainCategory";
import { Post } from "./Posts";

@Entity("sub_categories")
export class SubCategory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "main_category_id", type: "uuid" })
  mainCategoryId!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @ManyToOne(() => MainCategory, (main) => main.subCategories)
  @JoinColumn({ name: "main_category_id" })
  mainCategory!: MainCategory;

  @OneToMany(() => Post, (post) => post.subCategory)
  posts!: Post[];
}
