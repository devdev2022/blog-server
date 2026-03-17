import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import * as crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { Post } from "./Posts";

@Entity("post_media")
export class PostMedia {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = crypto.randomUUID();
    }
  }

  @Column({
    name: "post_id",
    type: "binary",
    length: 16,
    transformer: uuidTransformer,
  })
  postId!: string;

  @Column({ type: "enum", enum: ["image", "video"] })
  type!: "image" | "video";

  @Column({ type: "varchar", length: 500 })
  url!: string;

  @Column({ type: "int", default: 0 })
  order!: number;

  @ManyToOne(() => Post, (post) => post.media, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post!: Post;
}
