import Time "mo:core/Time";
import CommonTypes "../types/common";
import DietTypes "../types/diet";

module {
  // One day in nanoseconds
  let ONE_DAY_NS : Int = 86_400_000_000_000;

  public func generateDailyPlan(goal : ?CommonTypes.Goal) : DietTypes.DailyJourney {
    let tasks : [DietTypes.JourneyTask] = switch (goal) {
      case (? #muscle_gain) {
        [
          {
            id = 1;
            title = "Breakfast";
            name = "Breakfast";
            description = "High-protein breakfast — 4 boiled eggs + oatmeal with banana";
            time_label = "8:00 AM";
            time = "8:00 AM";
            task_type = #meal;
            xp_reward = 10;
            food_items = ["Boiled eggs", "Oatmeal", "Banana"];
            quantity = "4 eggs, 1 cup oatmeal, 1 medium banana";
            calories = 520;
            protein = 38;
          },
          {
            id = 2;
            title = "Drink Water";
            name = "Drink Water";
            description = "750ml water + electrolytes";
            time_label = "10:00 AM";
            time = "10:00 AM";
            task_type = #water;
            xp_reward = 10;
            food_items = ["Water"];
            quantity = "750ml";
            calories = 0;
            protein = 0;
          },
          {
            id = 3;
            title = "Lunch";
            name = "Lunch";
            description = "Chicken rice bowl with broccoli (500 kcal)";
            time_label = "1:00 PM";
            time = "1:00 PM";
            task_type = #meal;
            xp_reward = 10;
            food_items = ["Grilled chicken", "Brown rice", "Broccoli"];
            quantity = "200g chicken, 1 cup rice, 1 cup broccoli";
            calories = 500;
            protein = 45;
          },
          {
            id = 4;
            title = "Drink Water";
            name = "Drink Water";
            description = "750ml water";
            time_label = "3:00 PM";
            time = "3:00 PM";
            task_type = #water;
            xp_reward = 10;
            food_items = ["Water"];
            quantity = "750ml";
            calories = 0;
            protein = 0;
          },
          {
            id = 5;
            title = "Dinner";
            name = "Dinner";
            description = "Grilled salmon with sweet potato and salad";
            time_label = "7:00 PM";
            time = "7:00 PM";
            task_type = #meal;
            xp_reward = 10;
            food_items = ["Grilled salmon", "Sweet potato", "Green salad"];
            quantity = "150g salmon, 1 medium sweet potato, 1 bowl salad";
            calories = 480;
            protein = 42;
          },
          {
            id = 6;
            title = "Drink Water";
            name = "Drink Water";
            description = "750ml water";
            time_label = "8:00 PM";
            time = "8:00 PM";
            task_type = #water;
            xp_reward = 10;
            food_items = ["Water"];
            quantity = "750ml";
            calories = 0;
            protein = 0;
          },
        ];
      };
      // Default: fat_loss / lifestyle_balance (covers null, #fat_loss, #lifestyle_balance)
      case _ {
        [
          {
            id = 1;
            title = "Breakfast";
            name = "Breakfast";
            description = "Light protein breakfast — 2 boiled eggs + cucumber salad";
            time_label = "8:00 AM";
            time = "8:00 AM";
            task_type = #meal;
            xp_reward = 10;
            food_items = ["Boiled eggs", "Cucumber salad"];
            quantity = "2 eggs, 1 bowl cucumber salad";
            calories = 250;
            protein = 14;
          },
          {
            id = 2;
            title = "Drink Water";
            name = "Drink Water";
            description = "500ml water";
            time_label = "10:00 AM";
            time = "10:00 AM";
            task_type = #water;
            xp_reward = 10;
            food_items = ["Water"];
            quantity = "500ml";
            calories = 0;
            protein = 0;
          },
          {
            id = 3;
            title = "Lunch";
            name = "Lunch";
            description = "Grilled chicken salad with lemon dressing";
            time_label = "1:00 PM";
            time = "1:00 PM";
            task_type = #meal;
            xp_reward = 10;
            food_items = ["Grilled chicken", "Mixed greens", "Lemon dressing"];
            quantity = "150g chicken, 2 cups mixed greens";
            calories = 320;
            protein = 30;
          },
          {
            id = 4;
            title = "Drink Water";
            name = "Drink Water";
            description = "500ml water";
            time_label = "3:00 PM";
            time = "3:00 PM";
            task_type = #water;
            xp_reward = 10;
            food_items = ["Water"];
            quantity = "500ml";
            calories = 0;
            protein = 0;
          },
          {
            id = 5;
            title = "Dinner";
            name = "Dinner";
            description = "Vegetable soup with 1 roti";
            time_label = "7:00 PM";
            time = "7:00 PM";
            task_type = #meal;
            xp_reward = 10;
            food_items = ["Vegetable soup", "Roti"];
            quantity = "1 bowl soup, 1 roti";
            calories = 280;
            protein = 10;
          },
          {
            id = 6;
            title = "Drink Water";
            name = "Drink Water";
            description = "500ml water";
            time_label = "8:00 PM";
            time = "8:00 PM";
            task_type = #water;
            xp_reward = 10;
            food_items = ["Water"];
            quantity = "500ml";
            calories = 0;
            protein = 0;
          },
        ];
      };
    };

    let total_xp : Nat = tasks.size() * 10;
    {
      id = "default#" # (Time.now() / ONE_DAY_NS).toText();
      tasks;
      total_xp;
      date = Time.now();
      generated_by_ai = false;
    };
  };

  // Build the map key for journey progress: principal#day-bucket
  public func progressKey(principal : Principal, date : Int) : Text {
    let dayBucket = date / ONE_DAY_NS;
    principal.toText() # "#" # dayBucket.toText();
  };

  // Build the map key for daily plan storage: same format as progressKey
  public func dailyPlanKey(principal : Principal, date : Int) : Text {
    let dayBucket = date / ONE_DAY_NS;
    principal.toText() # "#plan#" # dayBucket.toText();
  };

  // Check if yesterday had any completions by looking for key in store
  public func yesterdayKey(principal : Principal, today : Int) : Text {
    let yesterdayBucket = today / ONE_DAY_NS - 1;
    principal.toText() # "#" # yesterdayBucket.toText();
  };
};
