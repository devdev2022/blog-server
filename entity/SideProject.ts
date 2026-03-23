import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { TechStack } from "./TechStack";

@Entity("side_projects")
export class SideProject {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true, default: null })
  description!: string | null;

  @Column({ name: "start_date", type: "varchar", length: 7 })
  startDate!: string;

  @Column({ name: "end_date", type: "varchar", length: 7, nullable: true, default: null })
  endDate!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true, default: null })
  link!: string | null;

  @ManyToOne(() => User, (user) => user.sideProjects)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToMany(() => TechStack, (tech) => tech.sideProjects)
  @JoinTable({
    name: "side_project_tech_stacks",
    joinColumn: { name: "side_project_id" },
    inverseJoinColumn: { name: "tech_stack_id" },
  })
  techStacks!: TechStack[];
}
