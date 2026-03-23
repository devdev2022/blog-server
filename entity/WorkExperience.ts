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

@Entity("work_experiences")
export class WorkExperience {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 200 })
  company!: string;

  @Column({ type: "varchar", length: 200 })
  position!: string;

  @Column({ type: "text", nullable: true, default: null })
  description!: string | null;

  @Column({ name: "start_date", type: "varchar", length: 7 })
  startDate!: string;

  @Column({ name: "end_date", type: "varchar", length: 7, nullable: true, default: null })
  endDate!: string | null;

  @Column({ name: "is_current", type: "boolean", default: false })
  isCurrent!: boolean;

  @ManyToOne(() => User, (user) => user.workExperiences)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToMany(() => TechStack, (tech) => tech.workExperiences)
  @JoinTable({
    name: "work_experience_tech_stacks",
    joinColumn: { name: "work_experience_id" },
    inverseJoinColumn: { name: "tech_stack_id" },
  })
  techStacks!: TechStack[];
}
