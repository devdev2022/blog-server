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

@Entity("work_experiences")
export class WorkExperience {
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
  company!: string;

  @Column({ type: "varchar", length: 200 })
  position!: string;

  @Column({ type: "text", nullable: true, default: null })
  description!: string | null;

  @Column({ name: "start_date", type: "date" })
  startDate!: Date;

  @Column({ name: "end_date", type: "date", nullable: true, default: null })
  endDate!: Date | null;

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
