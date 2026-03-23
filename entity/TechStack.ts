import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { WorkExperience } from "./WorkExperience";
import { SideProject } from "./SideProject";
import { TechStackCategory } from "./TechStackCategory";

@Entity("tech_stacks")
export class TechStack {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ name: "icon_url", type: "varchar", length: 500, nullable: true, default: null })
  iconUrl!: string | null;

  @Column({ name: "category_id", type: "uuid", nullable: true, default: null })
  categoryId!: string | null;

  @ManyToOne(() => TechStackCategory, (category) => category.techStacks, { nullable: true, eager: false })
  @JoinColumn({ name: "category_id" })
  category!: TechStackCategory | null;

  @ManyToMany(() => WorkExperience, (exp) => exp.techStacks)
  workExperiences!: WorkExperience[];

  @ManyToMany(() => SideProject, (project) => project.techStacks)
  sideProjects!: SideProject[];
}
