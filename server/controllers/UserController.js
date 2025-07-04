import prisma from "../Prisma_client.js";

export const getUserPublicProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username:username },
      select: {
        id: true,
        username: true,
        fullName: true,
        description: true,
        email: true,
        profileImage: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const gigs = await prisma.gigs.findMany({
      where: { userId: user.id },
      include: {
        reviews: true,
        createdBy: {
          select: {
            username: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return res.status(200).json({ user, gigs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
