import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import crypto from "crypto";
import { uuidTransformer } from "../utils/uuid.transformer";
import { User } from "./User";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryColumn({ type: "binary", length: 16, transformer: uuidTransformer })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = crypto.randomUUID();
    }
  }

  // FK 컬럼에 transformer를 직접 선언 → TypeORM이 저장 시 BINARY(16)으로 변환
  @Column({ type: "binary", length: 16, transformer: uuidTransformer })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column()
  token!: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: "datetime" })
  expires_at!: Date;
}
