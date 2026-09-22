public static double Calculate(string userInput)
{
	string[] parts = userInput.Split(' ');
	double sum = double.Parse(parts[0]);
	double percent = double.Parse(parts[1]);
    int months = int.Parse(parts[2]);

    double percentMonth = percent/1200;

    return sum * Math.Pow(1 + percentMonth, months);
}
