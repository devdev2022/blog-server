import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  BeforeInsert,
} from "typeorm";
import * as crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { User } from "./User";
import { TechStack } from "./TechStack";

@Entity("side_projects")
export class SideProject {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = crypto.randomUUID();
  }

  @Column({
    name: "user_id",
    type: "binary",
    length: 16,
    transformer: uuidTransformer,
  })
  userId!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true, default: null })
  description!: string | null;

  @Column({ name: "start_date", type: "date" })
  startDate!: Date;

  @Column({ name: "end_date", type: "date", nullable: true, default: null })
  endDate!: Date | null;

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
