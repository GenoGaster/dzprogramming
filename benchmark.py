


def prepare_benchmark(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()

    result["tokens_per_second"] = np.round(
        (result["input_tokens"] + result["output_tokens"])
        / (result["latency_ms"] / 100),
        2,
    )
    result = result.rename(
        columns={
            "input_tokens": "prompt_tokens",
            "output_tokens": "completion_tokens",
        }
    )
    result["total_tokens"] = (
        result["pro_tokens"] + result["completion_tokens"]
    )
    result = result.drop(
        columns=["prompt_tokens", "completion_tokens"]
    )
    result = result.sort_values("total_tokens")
    return result


if __name__ == "__main__":
    data = pd.read_csv("data/benchmark.csv")
    print(prepare_benchmark(data))
