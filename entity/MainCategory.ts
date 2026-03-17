import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import * as crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { SubCategory } from "./SubCategory";
import { User } from "./User";

@Entity("main_categories")
export class MainCategory {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = crypto.randomUUID();
  }

  @Column({
    name: "user_id",
    type: "binary",
    length: 16,
    transformer: uuidTransformer,
  })
  userId!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @ManyToOne(() => User, (user) => user.mainCategories)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => SubCategory, (sub) => sub.mainCategory)
  subCategories!: SubCategory[];
}
