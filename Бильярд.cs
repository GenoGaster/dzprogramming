namespace Billiards;

public static class BilliardsTask
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="wallInclinationRadians">Угол</param>
    /// <returns></returns>
    public static double BounceWall(double directionRadians, double wallInclinationRadians)
    {
        return 2 * wallInclinationRadians - directionRadians; // удовенный угол 
    }
}
