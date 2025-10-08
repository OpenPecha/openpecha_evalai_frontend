import { useSearchParams } from "react-router-dom";

const usePagination = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage=Number(searchParams.get("p")) || 1
    const setCurrentPage=(page:number)=>{
        setSearchParams({...Object.fromEntries(searchParams), p: page.toString()});
    }
    return {
        currentPage,
        setCurrentPage,
    }
}

export default usePagination;