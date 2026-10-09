namespace Pluralize;

public static class PluralizeTask
{
	public static string PluralizeRubles(int count)
	{
		var last = count % 10;
		var lastTwo = count % 100;

		if (lastTwo >= 11 && lastTwo <= 14)
		{
			return "рублей";
		}

		if (last == 1)
		{
			return "рубль";	
		}

		if (last >= 2 && last <= 4)
		{
			return "рубля";
		}

		return "рублей";
	}
}
