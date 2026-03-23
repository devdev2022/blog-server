import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Post } from "./Posts";

@Entity("post_media")
export class PostMedia {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "post_id", type: "uuid" })
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
