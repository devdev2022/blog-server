import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import * as crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { MainCategory } from "./MainCategory";
import { Post } from "./Posts";

@Entity("sub_categories")
export class SubCategory {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = crypto.randomUUID();
  }

  @Column({
    name: "main_category_id",
    type: "binary",
    length: 16,
    transformer: uuidTransformer,
  })
  mainCategoryId!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @ManyToOne(() => MainCategory, (main) => main.subCategories)
  @JoinColumn({ name: "main_category_id" })
  mainCategory!: MainCategory;

  @OneToMany(() => Post, (post) => post.subCategory)
  posts!: Post[];
}
