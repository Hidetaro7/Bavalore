// position top settings...
var checkimage = function () {
	if($("header img").height() > 10) {
		$(".bavalore_header").css("top", $("header").outerHeight());
	} else {
		setTimeout( checkimage, 30);
	}
}
checkimage();
//scroll
$(".bavalore_header nav").on("touchstart", function (e) {
	e.preventDefault();
	//$(".bavalore_header li:first-child a").text("a")
} )

$(".bavalore_header").Bavalore();