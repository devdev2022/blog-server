import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { PostMedia } from "./PostMedia";
import { Tag } from "./Tag";
import { SubCategory } from "./SubCategory";
import { MainCategory } from "./MainCategory";
import { Comment } from "./Comment";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({
    name: "edited_at",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  editedAt!: Date | null;

  @Column({ name: "is_suspended", type: "boolean", default: false })
  isSuspended!: boolean;

  @Column({ name: "temp", type: "boolean", default: false })
  temp!: boolean;

  @Column({
    name: "suspended_at",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  suspendedAt!: Date | null;

  @Column({
    name: "suspended_until",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  suspendedUntil!: Date | null;

  @Column({
    name: "suspend_reason",
    type: "varchar",
    length: 500,
    nullable: true,
    default: null,
  })
  suspendReason!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: "post_tags",
    joinColumn: { name: "post_id" },
    inverseJoinColumn: { name: "tag_id" },
  })
  tags!: Tag[];

  @OneToMany(() => PostMedia, (media) => media.post, { cascade: true })
  media!: PostMedia[];

  @Column({ name: "main_category_id", type: "uuid", nullable: true, default: null })
  mainCategoryId!: string | null;

  @ManyToOne(() => MainCategory, { nullable: true })
  @JoinColumn({ name: "main_category_id" })
  mainCategory!: MainCategory | null;

  @Column({ name: "sub_category_id", type: "uuid", nullable: true, default: null })
  subCategoryId!: string | null;

  @ManyToOne(() => SubCategory, (sub) => sub.posts, { nullable: true })
  @JoinColumn({ name: "sub_category_id" })
  subCategory!: SubCategory | null;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];
}
