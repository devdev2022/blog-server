import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
} from "typeorm";
import crypto from "crypto";

export const uuidTransformer = {
  to: (uuid: string) => Buffer.from(uuid.replace(/-/g, ""), "hex"),
  from: (bin: Buffer) => {
    const hex = bin.toString("hex");
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  },
};

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

  @CreateDateColumn()
  created_at!: Date;
}
