import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  OneToMany,
} from "typeorm";
import crypto from "crypto";
import { Post } from "./Posts";
import { MainCategory } from "./MainCategory";
import { WorkExperience } from "./WorkExperience";
import { SideProject } from "./SideProject";
import { uuidTransformer } from "../utils/uuid.transformer";

@Entity("users")
export class User {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = crypto.randomUUID();
    }
  }

  @Column({ unique: true, type: "bigint" })
  github_id!: number;

  @Column()
  username!: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ type: "varchar", length: 500, nullable: true, default: null })
  bio?: string | null;

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
