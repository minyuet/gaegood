import { userService } from "../services";

class UserContoller {
  async addUser(req, res, next) {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json("입력되지 않은 값이 있습니다!");
    }

    try {
      const { user, token } = await userService.addUser(req.body);
      if (token) {
        res.cookie("jwt_token", token);
      }
      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async getUser(req, res, next) {
    const { userId } = req.params;
    try {
      const user = await userService.getUserById(userId);
      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async getUserList(req, res, next) {
    try {
      const userList = await userService.getUserList();
      return res.status(200).json(userList);
    } catch (err) {
      next(err);
    }
  }

  async editUser(req, res, next) {
    const { userId } = req.params;
    try {
      const updatedUser = await userService.editUser(userId, req.body);
      return res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  }

  async removeUser(req, res, next) {
    const { userId } = req.params;

    try {
      await userService.removeUser(userId);
      if (req.loggedInUser.role === "basic-user") {
        res.clearCookie("jwt_token");
      }
      return res.status(200).json(`유저 삭제 완료(ID : ${userId})`);
    } catch (e) {
      next(e);
    }
  }
}

const userController = new UserContoller();

export { userController };
