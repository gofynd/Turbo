import { useCallback, useState } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { CATEGORIES_LISTING } from "../../queries/categoryQuery";

const useCategories = (fpi) => {
  const THEME = useGlobalStore(fpi.getters.THEME);
  const CATEGORIES = useGlobalStore(fpi.getters.CATEGORIES);
  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const pageConfig =
    mode?.page?.find((f) => f.page === "categories")?.settings?.props || {};

  const tranformCategoriesData = useCallback((data) => {
    return data
      ?.flatMap((item) => item?.items?.map((m) => m.childs))
      .flat()
      .flatMap((i) => i?.childs);
  }, []);

  const categoriesData = tranformCategoriesData(CATEGORIES?.data);

  const [departmentCategories, setDepartmentCategories] = useState([]);
  const [categories, setCategories] = useState(categoriesData || undefined);
  const [isLoading, setIsloading] = useState(false);

  function fetchAllCategories() {
    setIsloading(true);

    fpi
      .executeGQL(CATEGORIES_LISTING)
      .then((res) => {
        if (res?.data?.categories?.data?.length > 0) {
          const categoriesList = tranformCategoriesData(
            res?.data?.categories?.data
          );

          setCategories(categoriesList);
        } else {
          setCategories([]); // Ensure categories is cleared if no data is returned
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setCategories([]); // Clear categories on error
      })
      .finally(() => {
        setIsloading(false); // Only update loading state once all actions are complete
      });
  }

  const getCategoriesByDepartment = async (department) => {
    setIsloading(true);
    try {
      const res = await fpi.executeGQL(CATEGORIES_LISTING, { department });

      if (res?.data?.categories?.data?.length > 0) {
        const data = res?.data?.categories?.data;
        const categoriesList = data
          .flatMap((item) => item?.items?.map((m) => m.childs))
          .flat()
          .flatMap((i) => i?.childs);

        return categoriesList;
      }
      return [];
    } catch (error) {
      console.log(error);
    } finally {
      setIsloading(false);
    }
  };

  return {
    categories: categories || categoriesData,
    pageConfig,
    globalConfig,
    departmentCategories,
    setDepartmentCategories,
    fetchAllCategories,
    getCategoriesByDepartment,
    isLoading,
  };
};

export default useCategories;
