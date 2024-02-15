import { Command, Commands } from '@prisma/internals'

import { dispatchToSubCommand } from '../_lib/utils'

export class $ implements Command {
  public static new(commands: Commands): $ {
    return new $(commands)
  }

  private constructor(private readonly commands: Commands) {}

  public async parse(argv: string[]) {
    return dispatchToSubCommand(this.commands, argv)
  }
}