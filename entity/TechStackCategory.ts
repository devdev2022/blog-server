import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { TechStack } from "./TechStack";

@Entity("tech_stack_categories")
export class TechStackCategory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @OneToMany(() => TechStack, (techStack) => techStack.category)
  techStacks!: TechStack[];
}
