import React, { useEffect, useState } from "react";
import {
  useCreateMenuItemMutation,
  useGetMenuItemByIdQuery,
  useUpdateMenuItemMutation,
} from "../../Apis/menuItemApi";
import { inputHelper, toastNotify } from "../../Helper";
import { useNavigate, useParams } from "react-router-dom";
import { MainLoader } from "../../Components/Page/Common";
import { SD_Categories } from "../../Utility/SD";


interface NewProduct {
  productName: string;
  description: string;
  category: string;
  quantity: number;
  image: File | null;
  price: number;
 
}



const Categories = [
  SD_Categories.INSTANT,
  SD_Categories.BEVERAGE,
  SD_Categories.SWEETS,
  SD_Categories.JUICE,
  SD_Categories. DAIRY,
  SD_Categories.COOKIES,
  SD_Categories.WHEAT,
  SD_Categories.FRUITS,
];

const menuItemData = {
  name: "",
  description: "",
  specialTag: "",
  category: Categories[0],
  price: "",
};

function MenuItemUpsert() {
  const { id } = useParams();

  const navigate = useNavigate();
  const [imageToStore, setImageToStore] = useState<any>();
  const [imageToDisplay, setImageToDisplay] = useState<string>("");
  const [menuItemInputs, setMenuItemInputs] = useState(menuItemData);
  const [loading, setLoading] = useState(false);
  const [createMenuItem] = useCreateMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const { data } = useGetMenuItemByIdQuery(id);

  useEffect(() => {
    if (data && data.result) {
      const tempData = {
        name: data.result.name,
        description: data.result.description,
        specialTag: data.result.specialTag,
        category: data.result.category,
        price: data.result.price,
      };
      setMenuItemInputs(tempData);
      setImageToDisplay(data.result.image);
    }
  }, [data]);

  const handleMenuItemInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const tempData = inputHelper(e, menuItemInputs);
    setMenuItemInputs(tempData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const imgType = file.type.split("/")[1];
      const validImgTypes = ["jpeg", "jpg", "png"];

      const isImageTypeValid = validImgTypes.filter((e) => {
        return e === imgType;
      });

      if (file.size > 1000 * 1024) {
        setImageToStore("");
        toastNotify("File Must be less then 1 MB", "error");
        return;
      } else if (isImageTypeValid.length === 0) {
        setImageToStore("");
        toastNotify("File Must be in jpeg, jpg or png", "error");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      setImageToStore(file);
      reader.onload = (e) => {
        const imgUrl = e.target?.result as string;
        setImageToDisplay(imgUrl);
      };
    }
  };

  const validateForm = () => {
    const validationErrors = [];
  
    if (!menuItemInputs.name) {
      validationErrors.push("Product Name is required.");
    } else if (!/^[a-zA-Z0-9\s]+$/.test(menuItemInputs.name)) {
      validationErrors.push("Product Name must contain only alphanumeric characters.");
    } else if (menuItemInputs.name.length > 100) {
      validationErrors.push("Product Name must be a maximum of 100 characters.");
    }
  
    if (!menuItemInputs.description) {
      validationErrors.push("Description is required.");
    } else if (!/^[a-zA-Z0-9\s]+$/.test(menuItemInputs.description)) {
      validationErrors.push("Description must contain only alphanumeric characters.");
    } else if (menuItemInputs.description.length > 255) {
      validationErrors.push("Description must be a maximum of 255 characters.");
    }
  
    if (!menuItemInputs.category) {
      validationErrors.push("Category is required.");
    } else if (!/^[a-zA-Z0-9\s]+$/.test(menuItemInputs.category)) {
      validationErrors.push("Category must contain only alphanumeric characters.");
    } else if (menuItemInputs.category.length > 100) {
      validationErrors.push("Category must be a maximum of 100 characters.");
    }
  
    if (!menuItemInputs.price) {
      validationErrors.push("Price is required.");
    } else if (isNaN(parseFloat(menuItemInputs.price))) {
      validationErrors.push("Price must be a valid number.");
    }
    return validationErrors;
  };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      const validationErrors: string[] = validateForm(); // Validate the form inputs
    
      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => toastNotify(error, "error"));
        setLoading(false);
        return;
      }
    
      if (!imageToStore && !id) {
        toastNotify("Please upload an image", "error");
        setLoading(false);
        return;
      }
    
      const formData = new FormData();
      formData.append("Name", menuItemInputs.name);
      formData.append("Description", menuItemInputs.description);
      formData.append("SpecialTag", menuItemInputs.specialTag ?? "");
      formData.append("Category", menuItemInputs.category);
      formData.append("Price", menuItemInputs.price);
      if (imageToDisplay) formData.append("File", imageToStore);
    
      let response;
    
      if (id) {
        // Update existing menu item
        formData.append("Id", id);
        response = await updateMenuItem({ data: formData, id });
        toastNotify("Menu Item updated successfully", "success");
      } else if(validationErrors) {
        // Create a new menu item
        response = await createMenuItem(formData);
        toastNotify("Menu Item created successfully", "success");
      }
    
      if (response &&validationErrors) {
        setLoading(false);
        navigate("/menuItem/menuitemlist");
      }
    
      setLoading(false);
    };

  return (
    <div className="container border mt-5 p-5 bg-light">
      {loading && <MainLoader />}
      <h3 className=" px-2 text-success">
        {id ? "Edit Menu Item" : "Add Menu Item"}
      </h3>
     
      <form method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
        <div className="row mt-3">
          <div className="col-md-7">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Name"
              required
              name="name"
              value={menuItemInputs.name}
              onChange={handleMenuItemInput}
              maxLength={100}
            />
            <textarea
              className="form-control mt-3"
              placeholder="Enter Description"
              name="description"
              rows={10}
              value={menuItemInputs.description}
              onChange={handleMenuItemInput}
              maxLength={255}
              
            ></textarea>
            <input
              type="text"
              className="form-control mt-3"
              placeholder="Enter Special Tag"
              name="specialTag"
              value={menuItemInputs.specialTag}
              onChange={handleMenuItemInput}
            />
            <select
              className="form-control mt-3 form-select"
              placeholder="Enter Category"
              name="category"
              value={menuItemInputs.category}
              onChange={handleMenuItemInput}

            >
              {Categories.map((category) => (
                <option value={category}>{category}</option>
              ))}
            </select>
            <input
              type="number"
              className="form-control mt-3"
              required
              placeholder="Enter Price"
              name="price"
              value={menuItemInputs.price}
              onChange={handleMenuItemInput}
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="form-control mt-3"
            />
            <div className="row">
              <div className="col-6">
                <button
                  type="submit"
                  className="btn btn-success form-control mt-3"
                >
                  {id ? "Update" : "Create"}
                </button>
              </div>
              <div className="col-6">
                <a
                  onClick={() => navigate("/menuItem/menuitemlist")}
                  className="btn btn-secondary form-control mt-3"
                >
                  Back to Menu Items
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-5 text-center">
            <img
              src={imageToDisplay}
              style={{ width: "100%", borderRadius: "30px" }}
              alt=""
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default MenuItemUpsert;

