import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { Request } from 'express';
import type { ISupabaseAuthStrategyOptions } from 'interfaces';
import type { JwtFromRequestFunction } from 'passport-jwt';
import { Strategy } from 'passport-strategy';
import type { SupabaseAuthUser } from 'types';

import { SUPABASE_AUTH, UNAUTHORIZED } from '../constants';

export class SupabaseAuthStrategy extends Strategy {
  readonly name = SUPABASE_AUTH;

  private supabase: SupabaseClient;

  private extractor: JwtFromRequestFunction;

  success: (user: unknown, info: unknown) => void;

  fail: Strategy['fail'];

  constructor(options: ISupabaseAuthStrategyOptions) {
    super();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!options.extractor) {
      throw new Error(
        '\n Extractor is not a function. You should provide an extractor. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme',
      );
    }

    this.supabase = createClient(
      options.supabaseUrl,
      options.supabaseKey,
      (options.supabaseOptions = {}),
    );
    this.extractor = options.extractor;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    payload: SupabaseAuthUser | null,
  ): Promise<SupabaseAuthUser | null> {
    return payload;
  }

  authenticate(req: Request): void {
    const idToken = this.extractor(req);

    if (!idToken) {
      this.fail(UNAUTHORIZED, 401);

      return;
    }

    this.supabase.auth.api
      .getUser(idToken)
      .then((res) => this.validateSupabaseResponse(res.data))
      .catch((error) => {
        this.fail(error.message, 401);
      });
  }

  private async validateSupabaseResponse(data: SupabaseAuthUser | null) {
    const result = await this.validate(data);

    if (result) {
      this.success(result, {});

      return;
    }

    this.fail(UNAUTHORIZED, 401);
  }
}
