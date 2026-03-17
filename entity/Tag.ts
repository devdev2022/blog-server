import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  BeforeInsert,
} from "typeorm";
import crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { Post } from "./Posts";

@Entity("tags")
export class Tag {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = crypto.randomUUID();
  }

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts!: Post[];
}
