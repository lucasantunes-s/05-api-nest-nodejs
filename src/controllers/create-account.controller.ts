import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const createAccountBodySchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  @HttpCode(201)
  async handle(@Body() body: CreateAccountBodySchema) {
    const { email, name, password } = body

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (user) {
      throw new ConflictException('User e-mail already exists')
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.user.create({
      data: { email, name, password: hashedPassword },
    })
  }
}
