document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const rating = document.getElementById("rating").value;
  const comment = document.getElementsByName("comment")[0].value;

  if (!rating) {
    alert("Please select a rating!");
    return;
  }

  try {
    if (parseInt(rating) > 3) {
      // 4 ya 5 stars
      if (comment) {
        await navigator.clipboard.writeText(comment);
        alert(
          "Your comment has been copied to clipboard! Please paste it on Google."
        );
      } else {
        alert("Please proceed to leave your rating on Google.");
      }
      window.location.href = "https://g.page/r/CV1PXs1LM8vlEBM/review"; // Apna GMB link daal
    } else {
      // 3, 2, ya 1 star
      const response = await fetch("/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (response.ok) {
        alert("Thanks for your response!");
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong, please try again.");
  }
});
