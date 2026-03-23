import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Post } from "./Posts";
import { MainCategory } from "./MainCategory";
import { WorkExperience } from "./WorkExperience";
import { SideProject } from "./SideProject";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, type: "bigint" })
  github_id!: number;

  @Column()
  username!: string;

  @Column({ type: "varchar", length: 100, default: "개발자" })
  role!: string;

  @Column({
    name: "profile_avatar",
    type: "text",
    nullable: true,
    default: null,
  })
  profileAvatar?: string | null;

  @Column({
    name: "bio_avatar",
    type: "text",
    nullable: true,
    default: null,
  })
  bioAvatar?: string | null;

  @Column({ type: "varchar", length: 500, nullable: true, default: null })
  bio?: string | null;

  @Column({
    name: "blog_nickname",
    type: "varchar",
    length: 30,
    nullable: true,
    default: null,
    unique: true,
  })
  blogNickname?: string | null;

  @Column({ type: "boolean", default: false })
  withdrawal!: boolean;

  @Column({
    name: "withdrawal_date",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  withdrawalDate!: Date | null;

  @Column({
    name: "notification_read_at",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  notificationReadAt!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @OneToMany(() => MainCategory, (category) => category.user)
  mainCategories!: MainCategory[];

  @OneToMany(() => WorkExperience, (exp) => exp.user)
  workExperiences!: WorkExperience[];

  @OneToMany(() => SideProject, (project) => project.user)
  sideProjects!: SideProject[];
}
