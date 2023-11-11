import { axios } from "../config/axiosConfig";
import { PUBLISHED_RESULTS_URL } from "../constants/constants";
import { PublishedResultData } from "../types/types";
import ServerError from "../errors/ServerError";
import DataNotFoundError from "../errors/DataNotFoundError";

async function fetchPublishedResults(
  courseId: number,
): Promise<PublishedResultData[]> {
  try {
    const response = await axios.post(PUBLISHED_RESULTS_URL, {
      program: courseId,
    });

    let responseData: PublishedResultData[] = response.data;

    if (responseData.length === 0) {
      throw new DataNotFoundError(
        "No results have been published for this course yet.",
      );
    }

    responseData = responseData.map((result) => ({
      resultName: result.resultName,
      examDefId: result.examDefId,
      schemeId: result.schemeId,
    }));
    return responseData;
  } catch (error: any) {
    throw new ServerError();
  }
}

export default fetchPublishedResults;
