import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  CreateDateColumn,
} from "typeorm";
import * as crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { Post } from "./Posts";

@Entity("comments")
export class Comment {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = crypto.randomUUID();
  }

  @Column({
    name: "post_id",
    type: "binary",
    length: 16,
    transformer: uuidTransformer,
  })
  postId!: string;

  @Column({
    name: "parent_id",
    type: "binary",
    length: 16,
    transformer: uuidTransformer,
    nullable: true,
    default: null,
  })
  parentId!: string | null;

  @Column({ type: "varchar", length: 100 })
  nickname!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({
    name: "avatar_url",
    type: "varchar",
    length: 500,
    nullable: true,
    default: null,
  })
  avatarUrl!: string | null;

  @Column({ type: "text" })
  content!: string;

  @Column({
    name: "ip_address",
    type: "varchar",
    length: 45,
    nullable: true,
    default: null,
  })
  ipAddress!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({
    name: "edited_at",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  editedAt!: Date | null;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post!: Post;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parent_id" })
  parent!: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];
}
