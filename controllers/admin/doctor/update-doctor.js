import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";
import { uploadImage } from "../../../utils/cloudinary.js";

const updateDoctor = async (c) => {
  try {
    const {
      id,
      name,
      email,
      password,
      specialty,
      qualification,
      profileImage,
      phone,
      address,
    } = await c.req.json();

    if (!id) {
      return c.json({ error: "Doctor ID is required" }, 400);
    }

    const doctor = await db.doctor.findUnique({ where: { id } });

    if (!doctor) {
      return c.json({ error: "Doctor not found" }, 404);
    }

    const updatedData = {};

    if (name) {
      updatedData.name = name;
    }
    if (email) {
      updatedData.email = email.toLowerCase();
    }
    if (specialty) {
      updatedData.specialty = specialty;
    }
    if (qualification) {
      updatedData.qualification = qualification;
    }
    if (phone) {
      updatedData.phone = phone;
    }
    if (address) {
      updatedData.address = address;
    }
    if (password) {
      updatedData.password = await hashPassword(password);
    }
    if (profileImage) {
      const slug = (name || doctor.name).toLowerCase().replace(/\s+/g, "-");
      const { url } = await uploadImage(profileImage, slug, "doctor");
      updatedData.profileImage = url;
    }
    const updatedDoctor = await db.doctor.update({
      where: { id },
      data: {
        ...updatedData,
      },
    });

    return c.json(
      { message: "Doctor updated successfully", doctor: updatedDoctor },
      200,
    );
  } catch (error) {
    console.error("Error updating doctor:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default updateDoctor;
