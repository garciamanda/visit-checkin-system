import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });
  
    return res.status(201).json({
      message: 'Usuario criado com sucesso!',
      user: newUser
    })
  } catch (error) {
    console.log(`Erro ao criar o usuario: ${error}`);
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany()
    return res.status(200).json(users);
  } catch (error) {
    console.log(`Erro ao buscar usuarios:${error}`)
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) }
    })
    return res.status(200).json({
      message: 'Usuario deletado com sucesso!',
      user: deletedUser
    })
  } catch (error) {
    console.log(`Erro ao deletar usuario: ${error}`)
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, email, password } = req.body

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email, password }
    })

    return res.status(200).json({
      message: 'Usuario atualizado com sucesso!',
      user: updatedUser
    })
  } catch (error) {
    console.log(`Erro ao atualizar usuario: ${error}`)
  }
}