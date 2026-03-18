import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import * as crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { TechStack } from "./TechStack";

@Entity("tech_stack_categories")
export class TechStackCategory {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = crypto.randomUUID();
  }

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @OneToMany(() => TechStack, (techStack) => techStack.category)
  techStacks!: TechStack[];
}
