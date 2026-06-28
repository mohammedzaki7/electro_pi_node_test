import { SelectQueryBuilder } from "typeorm";
import { env } from "../config/env";
import { validate as uuidValidate } from "uuid";
import { AppError } from "./app-error";

export interface CursorQuery {
  limit?: number;
  cursor?: string;
}

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

export async function paginate<T extends { id: string }>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  query: CursorQuery,
): Promise<CursorPage<T>> {
  const limit = query.limit ?? env.pagination.defaultLimit;

  if (query.cursor) {
    if (!uuidValidate(query.cursor)) throw AppError.badRequest("Invalid pagination cursor");
    qb.andWhere(`${alias}.id > :afterId`, { afterId: query.cursor });
  }

  const rows = await qb.orderBy(`${alias}.id`, "ASC").take(limit + 1).getMany();

  const hasNextPage = rows.length > limit;
  const data = hasNextPage ? rows.slice(0, limit) : rows;

  return {
    data,
    nextCursor: hasNextPage ? data[data.length - 1].id : null,
  };
}
