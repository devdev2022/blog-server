import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import * as crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { WorkExperience } from "./WorkExperience";
import { SideProject } from "./SideProject";
import { TechStackCategory } from "./TechStackCategory";

@Entity("tech_stacks")
export class TechStack {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = crypto.randomUUID();
  }

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ name: "icon_url", type: "varchar", length: 500, nullable: true, default: null })
  iconUrl!: string | null;

  @Column({
    name: "category_id",
    type: "binary",
    length: 16,
    nullable: true,
    transformer: uuidTransformer,
  })
  categoryId!: string | null;

  @ManyToOne(() => TechStackCategory, (category) => category.techStacks, { nullable: true, eager: false })
  @JoinColumn({ name: "category_id" })
  category!: TechStackCategory | null;

  @ManyToMany(() => WorkExperience, (exp) => exp.techStacks)
  workExperiences!: WorkExperience[];

  @ManyToMany(() => SideProject, (project) => project.techStacks)
  sideProjects!: SideProject[];
}
