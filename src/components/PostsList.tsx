import { useEffect, useState } from "react";
import axios from "axios";

interface Posts {
  id: number;
  title: string;
  image: string;
  create_at: string;
  status: string;
}

export default function PostsList() {
  const [posts, setPosts] = useState<Posts[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentArticle, setCurrentArticle] = useState<Posts | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [inputSearch, setInputSearch] = useState<string>("");

  const [newPost, setNewPost] = useState<{
    title: string;
    image: string;
    create_at: string;
  }>({
    title: "",
    image: "",
    create_at: "",
  });
  const [error, setError] = useState<string>("");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<Posts | null>(null);

  const loadData = () => {
    axios
      .get(`http://localhost:8080/Posts?title_like=${inputSearch}`)
      .then((response) => setPosts(response.data))
      .catch((error) => console.error("Có lỗi xảy ra.", error));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [inputSearch]);

  const handleBlockClick = (article: Posts) => {
    setCurrentArticle(article);
    setShowModal(true);
  };

  const handleCancelBlock = () => {
    setShowModal(false);
    setCurrentArticle(null);
  };

  const handleConfirmBlock = () => {
    if (!currentArticle) return;

    const newStatus =
      currentArticle.status === "Ngừng xuất bản"
        ? "Đã xuất bản"
        : "Ngừng xuất bản";

    axios
      .patch(`http://localhost:8080/Posts/${currentArticle.id}`, {
        status: newStatus,
      })
      .then(() => {
        const updatedPosts = posts.map((article) =>
          article.id === currentArticle.id
            ? { ...article, status: newStatus }
            : article
        );
        setPosts(updatedPosts);
        setShowModal(false);
        setCurrentArticle(null);
      })
      .catch((error) => console.error("Có lỗi xảy ra.", error));
  };

  const handleAddPostClick = () => {
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleResetForm = () => {
    setShowResetConfirm(true);
  };

  const confirmResetForm = () => {
    setNewPost({ title: "", image: "", create_at: "" });
    setShowResetConfirm(false);
  };

  const handlePublishPost = () => {
    setError("");

    if (!newPost.title || !newPost.image || !newPost.create_at) {
      setError("Tên bài viết, hình ảnh và ngày thêm không được để trống");
      return;
    }

    if (posts.some((post) => post.title === newPost.title)) {
      setError("Tên bài viết không được phép trùng");
      return;
    }

    axios
      .post("http://localhost:8080/Posts", {
        ...newPost,
        status: "Đã xuất bản",
      })
      .then((response) => {
        setPosts([...posts, response.data]);
        setShowAddForm(false);
        setNewPost({ title: "", image: "", create_at: "" });
      })
      .catch((error) => console.error("Có lỗi xảy ra.", error));
  };

  const handleDeleteClick = (article: Posts) => {
    setPostToDelete(article);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!postToDelete) return;

    axios
      .delete(`http://localhost:8080/Posts/${postToDelete.id}`)
      .then(() => {
        const updatedPosts = posts.filter(
          (article) => article.id !== postToDelete.id
        );
        setPosts(updatedPosts);
        setShowDeleteConfirm(false);
        setPostToDelete(null);
      })
      .catch((error) => console.error("Có lỗi xảy ra.", error));
  };

  return (
    <>
      <div className="container my-3">
        <div className="d-flex justify-content-between">
          <div className="d-flex gap-2">
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm"
            />
            <select>
              <option value="all">Lọc bài viết</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAddPostClick}>
            Thêm mới bài viết
          </button>
        </div>
        <div className="table-container">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tiêu đề</th>
                <th>Hình ảnh</th>
                <th>Ngày viết</th>
                <th>Trạng thái</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((article, index) => (
                <tr key={article.id}>
                  <td>{index + 1}</td>
                  <td>{article.title}</td>
                  <td>
                    <img
                      className="img-fluid"
                      style={{ width: "150px", height: "80px" }}
                      src={article.image}
                      alt={article.title}
                    />
                  </td>
                  <td>{article.create_at}</td>
                  <td>
                    <span
                      className={`status ${
                        article.status === "Ngừng xuất bản"
                          ? "blocked"
                          : "published"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleBlockClick(article)}
                    >
                      Chặn
                    </button>
                    <button className="btn btn-warning mx-2">Sửa</button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteClick(article)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận</h2>
            <p>
              Bạn có chắc chắn muốn{" "}
              {currentArticle?.status === "Ngừng xuất bản"
                ? "xuất bản bài viết này?"
                : "ngừng xuất bản bài viết này?"}
            </p>
            <button
              className="btn btn-primary mb-2"
              onClick={handleCancelBlock}
            >
              Hủy
            </button>
            <button className="btn btn-danger" onClick={handleConfirmBlock}>
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-icon" onClick={handleCloseAddForm}>
              &times;
            </button>
            <h2>Thêm mới bài viết</h2>
            <label>
              Tên bài viết:
              <input
                type="text"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
              />
            </label>
            <label>
              Hình ảnh:
              <input
                type="text"
                value={newPost.image}
                onChange={(e) =>
                  setNewPost({ ...newPost, image: e.target.value })
                }
              />
            </label>
            <label>
              Ngày thêm:
              <input
                type="date"
                value={newPost.create_at}
                onChange={(e) =>
                  setNewPost({ ...newPost, create_at: e.target.value })
                }
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn border mb-2" onClick={handleResetForm}>
              Làm mới
            </button>
            <button className="btn btn-primary" onClick={handlePublishPost}>
              Xuất bản
            </button>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận</h2>
            <p>Bạn có chắc chắn muốn xóa hết giá trị trong các input?</p>
            <button
              className="btn btn-primary mb-2"
              onClick={() => setShowResetConfirm(false)}
            >
              Hủy
            </button>
            <button className="btn btn-danger" onClick={confirmResetForm}>
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận</h2>
            <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
            <button
              className="btn btn-primary mb-2"
              onClick={handleCancelDelete}
            >
              Hủy
            </button>
            <button className="btn btn-danger" onClick={handleConfirmDelete}>
              Đồng ý
            </button>
          </div>
        </div>
      )}
    </>
  );
}
