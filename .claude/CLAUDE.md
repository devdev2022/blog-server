# Project: [BLOG-SERVER]

## Language Rules

- 모든 결과값과 설명은 반드시 한글로 작성한다.

## API 개발 후 테스트 프로세스

API 제작이 완료되면 아래 순서로 테스트한다.

1. 프론트엔드의 `src/dummydata/` 에 해당 기능의 더미 데이터가 있는지 확인한다.
2. 더미 데이터가 있으면 `seed.ts`를 프로젝트 루트에 생성한다.
   - seed 전용 DataSource를 직접 선언한다. (`data-source.ts`는 `dist/entity/*.js`를 참조하므로 ts-node에서 사용 불가)
   - 모든 엔티티를 직접 import하여 entities 배열에 등록한다.
   - `synchronize: true`로 설정하여 누락된 컬럼도 자동 생성되도록 한다.
   - UUID parentId 등 null 가능한 참조는 삽입 순서에 따라 tempId → 실제 UUID로 매핑한다.
3. `npx ts-node --compiler-options '{"module":"commonjs"}' seed.ts` 로 실행한다.
4. 실행 완료 후 `seed.ts`를 즉시 삭제한다.

## TypeORM UUID 주의사항

- TypeORM은 createQueryBuilder로 UUID binary 컬럼을 파라미터로 비교하면 transformer가 적용되지 않아 항상 0건이 조회된다.
- UUID binary 컬럼 비교 시 raw query로 직접 `UNHEX(REPLACE(?, '-', ''))` 를 쓴다.
- `uuidTransformer.to`는 null을 처리하지 못한다. nullable인 UUID 컬럼(예: parentId)에 null이 들어오면 런타임 에러가 발생한다.
  - 새로운 nullable UUID 컬럼을 엔티티에 추가할 때마다 `utils/uuid.transformer.ts`의 `to` 함수가 null을 처리하는지 반드시 확인한다.
  - 현재 `to: (uuid: string | null) => uuid ? Buffer.from(...) : null` 형태로 수정되어 있다.
